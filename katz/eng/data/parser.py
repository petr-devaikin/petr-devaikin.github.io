#!/usr/bin/python
# -*- coding: utf-8 -*-

from datetime import datetime
from dateutil import relativedelta as rdelta
import json

ages = {}

f = open('date-sum-bd-gender.csv')
for line in f:
    data = line.split(';')
    if data[2]:
        money = int(data[1])
        oper = datetime.strptime(data[0], '%m/%d/%Y')
        bd = datetime.strptime(data[2], '%m/%d/%Y') if '/' in data[2] else datetime.strptime(data[2], '%d.%m.%Y')
        age = int(rdelta.relativedelta(oper ,bd).years)
        if not age in ages:
            ages[age] = {
                'age': age,
                'sum': 0,
                'count': 0,
                'male': {
                    'sum': 0,
                    'count': 0,
                },
                'female':  {
                    'sum': 0,
                    'count': 0,
                },
            }
        ages[age]['sum'] += money
        ages[age]['count'] += 1
        if int(data[3]) == 1:
            ages[age]['male']['sum'] += money
            ages[age]['male']['count'] += 1
        else:
            ages[age]['female']['sum'] += money
            ages[age]['female']['count'] += 1

for k in range(min(ages.keys()), max(ages.keys())):
    if not k in ages:
        ages[k] = {
            'age': k,
            'sum': 0,
            'male': {
                'sum': 0,
                'count': 0,
            },
            'female':  {
                'sum': 0,
                'count': 0,
            },
            'count': 0,
        }

result = [ages[age] for age in ages]

nf = open('date-sum-bd-gender-result.js', 'w')
nf.write('var genderData = ' + json.dumps(result) + ';')