from flask import Flask, send_from_directory

app = Flask(__name__, static_folder="static")


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/css/<path:filename>")
def css(filename):
    return send_from_directory("css", filename)


@app.route("/imagens/<path:filename>")
def imagens(filename):
    return send_from_directory("imagens", filename)


if __name__ == "__main__":
    app.run(debug=True)
