import json
import traceback
from bson import ObjectId


from Controller.bet import getcurrentfancyodds, placebet, bet_list
from flask import Flask, jsonify, request, make_response, render_template, abort
from flask_cors import CORS  # Import the CORS class from flask_cors
from functools import wraps
import jwt
from config.db import User,Lenah,Denah

app = Flask(__name__, template_folder='templates')
from config.db import Balances

# Define a list of allowed IP addresses
ALLOWED_IPS = ['192.168.0.1', '10.0.0.1', '127.0.0.1','192.168.1.3','104.21.27.222']
CORS(app, origins=['*','https://www.metaversesolutions.shop/','http://localhost:3000'])  # Enable CORS for all routes
secret_key = '1242#$%$^%!@@$!%*(%^metaversesolutions-metaversesolutions'

def success(obj, message=''):
    return {
        "status": "success",
        "data": obj,
        "message": message
    }
def error(obj, message=''):
    return {
                "message":message,
                "code": 401,
                "error": True,
                "data": {},
        }



# Decorator to check IP address before processing the request
@app.before_request
def limit_remote_addr():
    print(request.remote_addr)
    if request.remote_addr not in ALLOWED_IPS:
        abort(403)  # Forbidden error for non-whitelisted IP addresses

def jwt_middleware(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            received_token = request.headers.get('Authorization')
            if received_token:
                # Decode the JWT token
                print(received_token)
                decoded_payload = jwt.decode(received_token.split(' ')[1], secret_key, algorithms=['HS256'])
                userinfo = User.find_one({'username':decoded_payload['username']})
            else:
                print('Token has expired')
                return jsonify({'message':'failed',"notification":"Session Expired"}), 500
        except jwt.ExpiredSignatureError:
            print('Token has expired')
            return jsonify({'message':'failed',"notification":"Session Expired"}), 500
        except jwt.InvalidTokenError:
            print('Invalid token')
            print(str(traceback.format_exc()),"error")
            return jsonify({'message':'failed',"notification":"Session Expired"}), 500
        # You can perform additional checks based on the current_user if needed
        return fn(userinfo, *args, **kwargs)
    return wrapper

@app.route('/')
def index():
    response = make_response(render_template('index.html'))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

@app.route("/api/", methods=["GET"])
def getAllData():
    balance = Balances.find_one({'exposer': 0})
    print(f'Balance for account 12345: {balance}')
    user = {"message":"Welcome to python server"}
    return user

@app.route("/api/getfancysingle/<MatchID>/<selection_id>", methods=["GET"])
def getFancyOdds(MatchID, selection_id):
    try:
        response = getcurrentfancyodds(MatchID, selection_id)
        user = {"data":response}
        return user
    except Exception as e:
        print(e)
        return 'failed'
@app.route("/api/placebet", methods=["post"])
@jwt_middleware
def placebetuser(userinfo):
    try:
        payload = request.data.decode('utf-8')
        # print(payload)
        if payload != '':
            response =  placebet(payload, userinfo)
            print(response)
            print("response hello world")
            response = json.loads(response)
            if "error" in response and response["error"]==False:
                return jsonify(success(response, response["message"])), 201
            else:
                return jsonify(error(response, response["message"])), 401
        else:
            return jsonify(error(response, "Bet one is not Acceptable")), 401
    except Exception as e:
        print(str(traceback.format_exc()),"error")
        return jsonify(error(response, "Bet two is not Acceptable")), 401

@app.route("/api/bets", methods=["get"])
@jwt_middleware
def bethistory(userinfo):
    try:
        payload = request.args.get('matchId')
        if payload != '':
            print("responsebefore")
            response =  bet_list(userinfo, payload )
            #print(response)
            print("response")
            response = json.loads(response)
            if "error" in response and response["error"]==False:
                return jsonify(success(response, response["message"])), 201
            else:
                return jsonify(success(response, response["message"])), 201
        else:
            return jsonify(error(response, "Bet Not Found")), 401
    except Exception as e:
        print(str(traceback.format_exc()),"error")
        return jsonify(error(response, "Bet Not Found")), 401

 
# @app.route("/api/lena-dena",methods=["get"])  
# @jwt_middleware
# def lena_dena(userinfo):
#     try:
#         lenaData  = Lenah.find({"ParentId":userinfo['_id']})
#         DenaData = Denah.find({"ChildId":userinfo['_id']})
#         data =[lenaData,DenaData]

#         return jsonify(success(data)),201
#     except Exception as e:
#         print(str(traceback.format_exc()),"error")
#         return jsonify(error("Bet Not Found")), 401

# @app.route("/api/lena-dena", methods=["GET"])
# @jwt_middleware
# def lena_dena(userinfo):
#     try:
#         # Fetch data from MongoDB
#         print(userinfo,"userinfo")
#         lenaData = list(Lenah.find({"Username": userinfo['username']})) 
#         print(lenaData,"lenaDeta") # Convert cursor to list
#         # DenaData = list(Denah.find({"ChildId": userinfo['_id']}))  # Convert cursor to list
        
#         # Combine data
#         data = [lenaData]

#         # Return the combined data as JSON
#         return jsonify(success(data)), 201
#     except Exception as e:
#         print(str(traceback.format_exc()), "error")
#         return jsonify(error("Bet Not Found")), 401

def objectid_to_str(doc):
    """Helper function to convert ObjectId fields in MongoDB documents to strings."""
    if isinstance(doc, dict):
        # If it's a dictionary, process each key-value pair
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)  # Convert ObjectId to string
            elif isinstance(value, dict) or isinstance(value, list):
                doc[key] = objectid_to_str(value)  # Recursively process nested dictionaries or lists
    elif isinstance(doc, list):
        # If it's a list, process each element
        for i in range(len(doc)):
            doc[i] = objectid_to_str(doc[i])
    return doc

@app.route("/api/lena-dena", methods=["GET"])
@jwt_middleware
def lena_dena(userinfo):
    try:
        # Fetch data from MongoDB
        lenaData = list(Lenah.find({"ParentId": userinfo['_id']}))  # Convert cursor to list
        DenaData = list(Denah.find({"ChildId": userinfo['_id']}))  # Convert cursor to list

        # Convert ObjectIds to strings in the result data
        lenaData = objectid_to_str(lenaData)
        DenaData = objectid_to_str(DenaData)

        # Combine data
        data = [lenaData, DenaData]

        # Return the combined data as JSON
        return jsonify(success(data)), 201
    except Exception as e:
        print(str(traceback.format_exc()), "error")
        return jsonify(error("Bet Not Found")), 401

if __name__ == "__main__":
    app.run(debug=True)
