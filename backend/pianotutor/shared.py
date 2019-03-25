from flask import jsonify


def error_response(error):
    return jsonify({'error': error})