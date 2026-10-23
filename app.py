
from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def Home():
    return jsonify({
        "message": "Backend Flask funcionando",
        "status": "online"
    })


@app.route("/api/health")
def Health():
    return jsonify({
        "status": "ok"
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
