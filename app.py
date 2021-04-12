import os.path
from flask import Flask, escape, request, Response, render_template
from flask_script import Manager

app = Flask(__name__)
manager = Manager(app)

#configs

app.config['DEBUG'] = True

# utils methods

def root_dir():  # pragma: no cover
    return os.path.abspath(os.path.dirname(__file__))

def get_file(filename):
    try:
        src = os.path.join(root_dir(), filename)
        return open(src).read()
    except IOError as exc:
        return str(exc)

#routes

@app.route('/')
def base():
    return render_template("base.html")

#pages

@app.route('/home')
def home():
    return render_template("home.html")

@app.route('/visualizations/vaccine')
def vaccine():
    return render_template("visualizations/vaccine.html")

@app.route('/visualizations/collateral')
def collateral():
    return render_template("visualizations/collateral.html")

#files

@app.route('/files/vaccinations')
def vaccine_file():
    content = get_file('datasets/country_vaccinations.csv')
    return Response(content, mimetype="text/csv")

@app.route('/files/us_map')
def us_map_file():
    content = get_file('datasets/us.json')
    return Response(content, mimetype="application/json")

@app.route('/files/vaccinations_collateral')
def vaccine_collateral_vaccine_file():
    content = get_file('datasets/2021VAERSDATA.csv')
    return Response(content, mimetype="text/csv")


#runner

if __name__ == '__main__':
    manager.run()