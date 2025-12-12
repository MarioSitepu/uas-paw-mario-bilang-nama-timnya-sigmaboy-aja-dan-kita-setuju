from setuptools import setup, find_packages

setup(
    name='app',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        'pyramid==2.0.2',
        'waitress==2.1.2',
        'pyramid-jinja2==2.10',
        'SQLAlchemy>=2.0.0',
        'alembic==1.12.1',
        'pyramid-tm==2.5',
        'transaction==4.0',
        'zope.sqlalchemy==3.1',
        'psycopg[binary]>=3.1.0',
        'python-dotenv>=1.0.0',
    ],
    entry_points={
        'paste.app_factory': [
            'main = app:main',
        ],
    },
)

