import json

def getUfo(line):
  try:
    return json.loads(line.strip(), strict=False)
  except Exception as e:
    return {}

ufos = [getUfo(line) for line in open('../data/ufo_awesome.json')]
empty = sum([1 if rec == {} else 0 for rec in ufos])
print "Total of ", empty, " errors reading ", len(ufos), " records."

def metaDataize(record):
  return record['location']

metadata = [metaDataize(record) for record in ufos if record != {}]
json.dump(metadata, open('../data/ufo_metadata.json', 'w'))
