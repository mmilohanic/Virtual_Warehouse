# Virtual_Warehouse
Projektni zadatak u sklopu kolegija Informacijski sustavi, Fakultet informatike u Puli.<br><br>
Tema projekta je izrada web aplikacije za potrebe vođenja virtualnog skladišta u poslovanju.<br><br>
Cilj projekta je kreiranje funcionalnog backend dijela aplikacije kojim se omogućuje korisniku da putem frontenda<br>vrši interakciju sa bazom podataka koristeći ```CRUD``` operacije nad podacima.

## Opis teme
**Virtual Warehouse** je web aplikacija osmišljena s ciljem udaljenog upravljanja skladištem s bilo koje lokacije.<br><br>
Aplikacija omogućuje korisniku unos, čitanje, izmjenu, brisanje, filtriranje, sortiranje i pretraživanje artikala unutar baze podataka, te također omogućuje korisniku izvoz artikala u obliku Excel tablice.

## Use Case dijagram
![IS_Use_Case_Virtual_Warehouse](https://github.com/MMFipu/Virtual_Warehouse/blob/main/Virtual_Warehouse_Use_Case_IS.png)

# Preuzimanje, instalacija i pokretanje
## Preuzimanje
Nakon što imate preuzet ```Docker```, pozicionirajte se u direktorij u koji želite preuzeti projekt, otvorite terminal u tom direktoriju i izvršite sljedeće naredbe:
```bash
git clone https://github.com/MMFipu/Virtual_Warehouse.git
cd Virtual_Warehouse
```
## Instalacija i pokretanje
Unutar terminala izvršite sljedeće naredbe:
```bash
docker build --tag vwhouse .
docker run -p 5003:5003 vwhouse
```
Potom aplikaciju možete pokrenuti na linkovima danim u terminalu.

## Korištene tehnologije
- Python
- HTML
- CSS
- JavaScript
- SQLite3
- Docker
