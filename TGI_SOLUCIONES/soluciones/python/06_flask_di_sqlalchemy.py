"""
Inyección de dependencias en Flask + SQLAlchemy (reportado en EPAM: "¿cómo funciona
la DI en una app Flask con SQLAlchemy?").

Flask no trae un contenedor de DI (FastAPI sí, con Depends). Los patrones habituales:
1. App factory (create_app) que recibe la configuración -> permite crear apps distintas
   para tests y producción.
2. Una sesión de BD POR PETICIÓN guardada en `g`, cerrada en teardown_appcontext.
3. Capas: ruta -> servicio -> repositorio. El servicio recibe el repositorio por
   constructor, así en tests se inyecta un repositorio falso sin tocar la BD.
4. (Alternativa) Flask-SQLAlchemy hace lo del punto 2 con db.session (scoped_session),
   o una librería como `dependency-injector`.

Requiere: pip install flask sqlalchemy
"""
from dataclasses import dataclass

from flask import Flask, abort, current_app, g, jsonify, request
from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker


# --- Modelo -----------------------------------------------------------------
class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)


# --- Repositorio (acceso a datos) --------------------------------------------
class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def get(self, user_id: int) -> User | None:
        return self.session.get(User, user_id)

    def by_email(self, email: str) -> User | None:
        return self.session.scalar(select(User).where(User.email == email))

    def add(self, user: User) -> User:
        self.session.add(user)
        self.session.flush()  # obtiene el id sin hacer commit
        return user


# --- Servicio (lógica de negocio, no sabe nada de Flask ni de SQL) -----------
@dataclass
class UserService:
    repo: UserRepository

    def register(self, email: str) -> User:
        if "@" not in email:
            raise ValueError("email inválido")
        if self.repo.by_email(email):
            raise ValueError("email duplicado")
        return self.repo.add(User(email=email))


# --- "Contenedor" mínimo: proveedores ligados al contexto de la petición -----
def get_session() -> Session:
    if "db_session" not in g:
        g.db_session = current_app.extensions["session_factory"]()
    return g.db_session


def get_user_service() -> UserService:
    return UserService(UserRepository(get_session()))


def create_app(database_url: str = "sqlite:///:memory:") -> Flask:
    app = Flask(__name__)
    engine = create_engine(database_url)
    Base.metadata.create_all(engine)
    app.extensions["session_factory"] = sessionmaker(bind=engine, expire_on_commit=False)

    @app.teardown_appcontext
    def close_session(exc):
        session = g.pop("db_session", None)
        if session is not None:
            if exc is None:
                session.commit()
            else:
                session.rollback()
            session.close()

    @app.post("/users")
    def create_user():
        try:
            user = get_user_service().register(request.json["email"])
        except ValueError as e:
            return jsonify(error=str(e)), 400
        return jsonify(id=user.id, email=user.email), 201

    @app.get("/users/<int:user_id>")
    def read_user(user_id: int):
        user = UserRepository(get_session()).get(user_id)
        if user is None:
            abort(404)
        return jsonify(id=user.id, email=user.email)

    return app


if __name__ == "__main__":
    # Test del servicio aislado: se inyecta un repositorio falso, sin Flask ni BD
    class FakeRepo:
        def __init__(self):
            self.data = {}

        def by_email(self, email):
            return self.data.get(email)

        def add(self, user):
            user.id = len(self.data) + 1
            self.data[user.email] = user
            return user

    svc = UserService(FakeRepo())  # type: ignore[arg-type]
    assert svc.register("a@b.com").id == 1

    # Test de integración con la app real (SQLite en archivo temporal)
    import os
    import tempfile

    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    try:
        client = create_app(f"sqlite:///{path}").test_client()
        r = client.post("/users", json={"email": "ana@x.com"})
        assert r.status_code == 201, r.json
        uid = r.json["id"]
        assert client.get(f"/users/{uid}").json["email"] == "ana@x.com"
        assert client.post("/users", json={"email": "ana@x.com"}).status_code == 400
        assert client.get("/users/999").status_code == 404
        print("OK - Flask DI")
    finally:
        os.remove(path)
