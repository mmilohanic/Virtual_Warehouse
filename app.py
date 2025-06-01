from flask import Flask, request, render_template, redirect, url_for, send_file
from sqlalchemy import event, asc, desc, or_
from datetime import datetime
from dateutil.relativedelta import relativedelta
from models import *
from export import export_records_to_excel


app = Flask(__name__)

# Povezivanje s bazom podataka
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///artikli.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

babel.init_app(app)

# Kreiranje tablica (ako već ne postoje)
with app.app_context():
    db.create_all()

# Učitavanje HTML-a modala za unos/edit
with open('templates/modal.html', 'r') as file:
    modal = file.read()


# Kreiranje audita detektiranjem kreiranja novog retka u tablici
@event.listens_for(Artikl, 'before_insert')
def insert_listener(mapper, connection, target):
    target.datum_dodavanja = datetime.now().replace(microsecond=0)
    target.datum_izmjene = datetime.now().replace(microsecond=0)


# Kreiranje audita detektiranjem promjene nad postojećim retcima u tablici
@event.listens_for(Artikl, 'before_update')
def update_listener(mapper, connection, target):
    target.datum_izmjene = datetime.now().replace(microsecond=0)


@app.route('/')
def index():
    artikli = Artikl.query.all()
    artikli = list(map(lambda artikl: artikl.datetime_to_locale().to_dict(), artikli))
    return render_template("index.html", artikli=artikli, modal=modal, title="Početna")


@app.route('/unos',  methods=['GET', 'POST'])
def unos():
    if request.method == 'POST':
        artikli = request.get_json()
        for artikl in artikli:
            novi_artikl = Artikl(
                naziv=artikl['naziv'],
                opis=artikl['opis'],
                cijena=artikl['cijena'],
                dostupna_kolicina=artikl['dostupna_kolicina'],
                minimalna_kolicina=artikl['minimalna_kolicina'],
            )
            db.session.add(novi_artikl)
        db.session.commit()
        print("tu smo")
        return redirect(url_for("index"))
    return render_template("unos.html", modal=modal, title="Unos")


@app.route('/edit_or_delete', methods=['PUT', 'DELETE'])
def izmjena():
    if request.method == 'PUT':
        artikli = request.get_json()
        for artikl in artikli:
            postojeci_artikl = db.session.get(Artikl, artikl.pop("id"))
            postojeci_artikl.naziv = artikl["naziv"]
            postojeci_artikl.opis = artikl["opis"]
            postojeci_artikl.cijena = artikl["cijena"]
            postojeci_artikl.dostupna_kolicina = artikl["dostupna_kolicina"]
            postojeci_artikl.minimalna_kolicina = artikl["minimalna_kolicina"]

    if request.method == 'DELETE':
        artikli = request.get_json()
        for artikl in artikli:
            db.session.delete(db.session.get(Artikl, artikl["id"]))

    db.session.commit()
    return redirect(url_for("index"))


@app.route('/search', methods=['GET'])
def pretrazivanje():
    term = request.args.get('pojam', type=str)
    artikli = Artikl.query.filter(or_(
        Artikl.naziv.ilike(f"%{term}%"),
        Artikl.opis.ilike(f"%{term}%")
    )).all()
    artikli = list(map(lambda artikl: artikl.to_dict(), artikli))
    return render_template("index.html", artikli=artikli, modal=modal, title="Pretraživanje")


@app.route('/sort/<string:value>/<string:order>', methods=['GET', 'POST'])
def sortiranje(value, order):
    variables = {"Artikl": Artikl, "asc": asc, "desc": desc}
    exec(f"artikli = Artikl.query.order_by({order}(Artikl.{value})).all()", variables)
    artikli = list(map(lambda artikl: artikl.to_dict(), variables["artikli"]))
    return render_template("index.html", artikli=artikli, modal=modal, title="Sortiranje")


@app.route('/filter', methods=['GET'])
def filtriranje():
    zahtjevi = request.args
    filteri = []
    if zahtjevi.get('min_kolicina'):
        filteri.append(Artikl.dostupna_kolicina >= zahtjevi.get('min_kolicina', type=int))
    if zahtjevi.get('max_kolicina'):
        filteri.append(Artikl.dostupna_kolicina <= zahtjevi.get('max_kolicina', type=int))
    if zahtjevi.get('min_cijena'):
        filteri.append(Artikl.cijena >= zahtjevi.get('min_cijena', type=float))
    if zahtjevi.get('max_cijena'):
        filteri.append(Artikl.cijena <= zahtjevi.get('max_cijena', type=float))
    if zahtjevi.get('god_dodavanja'):
        zadnji_datum = datetime.utcnow() - relativedelta(years=zahtjevi.get('god_dodavanja', type=int))
        filteri.append(Artikl.datum_dodavanja >= zadnji_datum)
    if zahtjevi.get('god_izmjene'):
        zadnji_datum = datetime.utcnow() - relativedelta(years=zahtjevi.get('god_dodavanja', type=int))
        filteri.append(Artikl.datum_izmjene >= zadnji_datum)
    if not filteri:
        return redirect(url_for('index'))
    artikli = Artikl.query.filter(*filteri).all()
    artikli = list(map(lambda artikl: artikl.to_dict(), artikli))
    return render_template("index.html", artikli=artikli, modal=modal, title="Filtriranje")


@app.route('/export', methods=['POST'])
def download():
    id_list = request.get_json()
    artikli = list(map(lambda idx: db.session.get(Artikl, idx).to_dict(id_col=False), id_list))
    excel_file = export_records_to_excel(artikli)
    return send_file(
        excel_file,
        as_attachment=True,
        download_name="popis_artikala.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)
