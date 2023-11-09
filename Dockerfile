FROM python:3.11

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /code

COPY Pipfile Pipfile.lock .

RUN set -ex && \
    python -m pip install --upgrade pip pipenv && \
    python -m pip install gunicorn && \
    python -m pip install whitenoise && \
    pipenv install --deploy --system

COPY src/ .

EXPOSE 8000

CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "order_nest.wsgi"]
