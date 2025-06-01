from flask_sqlalchemy import SQLAlchemy
from flask_babel import Babel, format_datetime

db = SQLAlchemy()
babel = Babel(default_locale='hr_HR')


class Artikl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    naziv = db.Column(db.String(100), nullable=False)
    opis = db.Column(db.String(200), nullable=True)
    dostupna_kolicina = db.Column(db.Integer, nullable=False)
    minimalna_kolicina = db.Column(db.Integer, nullable=False)
    cijena = db.Column(db.Numeric(7, 2), nullable=False)
    datum_dodavanja = db.Column(db.DateTime, nullable=False)
    datum_izmjene = db.Column(db.DateTime, nullable=False)

    def to_dict(self, id_col=True):
        dict_ent = {
            "id": self.id,
            "naziv": self.naziv,
            "opis": self.opis,
            "dostupna_kolicina": self.dostupna_kolicina,
            "minimalna_kolicina": self.minimalna_kolicina,
            "cijena": self.cijena,
            "datum_dodavanja": self.datum_dodavanja,
            "datum_izmjene": self.datum_izmjene,
        }
        if id_col:
            return dict_ent
        else:
            return dict(list(dict_ent.items())[1:])

    def datetime_to_locale(self):
        format_style = "dd-MM-yyyy 'at' HH:mm:ss"
        self.datum_dodavanja = format_datetime(self.datum_dodavanja, format_style)
        self.datum_izmjene = format_datetime(self.datum_izmjene, format_style)
        return self
