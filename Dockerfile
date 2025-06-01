FROM python:3.12
WORKDIR /app
COPY . /app
RUN pip3 install -r requirements.txt
EXPOSE 5003
CMD ["python", "app.py"]