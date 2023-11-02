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

import requests
import urllib2

if messageIsRequest:
    request = helpers.analyzeRequest(messageInfo)
    headers = request.getHeaders()
    url_base = str(request.getUrl())
    if '/rest/' in url_base:
        print('########################################################################')
        rest_index = url_base.find("/rest/")
        new_url = url_base[rest_index + len("/rest/"):]
        challengeHeaders = {}
        for header in headers:
            if header.startswith('Challenge'):
                challengeHeaders['Challenge'] = header
            if header.startswith('Endpoint'):
                challengeHeaders['Endpoint'] = header
            if header.startswith('Body'):
                challengeHeaders['Body'] = header
            if header.startswith('Authorization'):
                challengeHeaders['Authorization'] = header
            if header.startswith('Key'):
                challengeHeaders['Key'] = header

        url = [ord(char) for char in new_url]
        msg = messageInfo.getRequest()[request.getBodyOffset():].tostring()

        parsed_values = {}

        parsed_values['challenge'] = challengeHeaders['Challenge'].split(':')[
            1].split(',')
        parsed_values['endpoint'] = challengeHeaders['Endpoint'].replace(
            'Endpoint: ', '')
        parsed_values['body'] = challengeHeaders['Body'].replace('Body: ', '')
        parsed_values['key'] = challengeHeaders['Key'].replace('Key: ', '')

        parsed_values['challenge'] = [int(s) for s in parsed_values['challenge']]

        concatenated_data = parsed_values['challenge']
        concatenated_data.extend([ord(char) for char in parsed_values['endpoint']])
        concatenated_data.append(10)
        concatenated_data.append(123)
        concatenated_data.extend([ord(byte) for byte in msg][1:-1])
        concatenated_data.append(125)

        request = urllib2.Request('http://localhost:5000/get_token', json.dumps({'key': parsed_values['key'], 'data': concatenated_data}), headers={'Content-Type': 'application/json'})
        request.get_method = lambda: 'POST'
        response = urllib2.urlopen(request)
        response_data = response.read()
        response.close()

        for header in headers:
            if header.startswith('Authorization'):
                headers.remove(header)
        new_auth_header = 'Authorization: TBMobile {0} {1}'.format(1, str(response_data))
        print(new_auth_header)
        headers.add(new_auth_header)
        new_request = helpers.buildHttpMessage(headers, msg)
        messageInfo.setRequest(new_request)