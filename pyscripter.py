import binascii
import sys
import time
import uuid
import hashlib
import hmac
import base64
import re
import json
import unicodedata
from datetime import datetime
import urllib
import re
import urllib2

if messageIsRequest:
    request = helpers.analyzeRequest(messageInfo)
    headers = request.getHeaders()
    url_base = str(request.getUrl())
    previoudAuthHeaderIdx = 0
    for index, header in enumerate(headers):
        if header.startswith('Authorization'):
            previoudAuthHeaderIdx = index
            break
    if '/rest/' in url_base:
        print('########################################################################')
        server_url = "http://localhost:3000/challenge"
        challenge = ''
        response = urllib2.urlopen(server_url)
        data = json.loads(response.read())
        challenge = data['challenge']
        rest_index = url_base.find("/rest/")
        new_url = url_base[rest_index + len("/rest/"):]

        url = [ord(char) for char in new_url]
        msg = messageInfo.getRequest()[request.getBodyOffset():].tostring()

        concatenated_data = challenge
        concatenated_data.extend(url)
        concatenated_data.append(10)
        concatenated_data.append(123)
        concatenated_data.extend([ord(byte) for byte in msg][1:-1])
        concatenated_data.append(125)

        request = urllib2.Request('http://localhost:5000/get_token', json.dumps({'key': data['key'], 'data': concatenated_data}), headers={'Content-Type': 'application/json'})
        request.get_method = lambda: 'POST'
        response = urllib2.urlopen(request)
        response_data = response.read()
        response.close()

        new_auth_header = 'Authorization: TBMobile {0} {1}'.format(data['index'], str(response_data))
        print(new_auth_header)
        headers[previoudAuthHeaderIdx] = new_auth_header
        new_request = helpers.buildHttpMessage(headers, msg)
        messageInfo.setRequest(new_request)
