import psycopg2

# Połączenie z bazą danych PostgreSQL
conn = psycopg2.connect(
    host="localhost",        # lub adres IP kontenera, jeśli PostgreSQL działa w kontenerze
    port="5435",             # standardowy port PostgreSQL
    database="InzynieriaOproPosgres",   # nazwa Twojej bazy danych
    user="postgres",  # nazwa użytkownika PostgreSQL
    password="changeme!"   # hasło do użytkownika PostgreSQL
)

cursor = conn.cursor()

# Wczytanie pliku obrazu jako dane binarne
with open('C:/Users/JakubAndrzejewski/Downloads/minions.jpg', 'rb') as file:
    binary_data = file.read()

# Przygotowanie zapytania SQL do wstawienia obrazu do bazy danych
sql = """
INSERT INTO public."Pins"
("ID", "UserId", "Longitude", "Latitude", "PostTypeId", "CategoryId", "Title", "Description", "LikesUp", "LikesDown", "Zdjecia")
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# Wstawienie danych, w tym obrazu
cursor.execute(sql, (
    1, 18, 16.99787, 52.39999, 1, 2, 
    'Problemy na Malcie', 'Maltanka się popsuła i dalej nie pojedzie więc lipa ogólnie', 
    0, 0, psycopg2.Binary(binary_data)
))

# Zatwierdzenie transakcji
conn.commit()

# Zamknięcie kursora i połączenia
cursor.close()
conn.close()

print("Obraz został poprawnie wstawiony do bazy danych.")
