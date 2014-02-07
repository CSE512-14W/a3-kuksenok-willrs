import json, time
from geopy import geocoders

class LocalLoc:
  def __init__(self):
    self.coder = geocoders.Nominatim()
    self.calls = 0;
    self.good = 0;
    try:
      self.cache = json.load(open('../data/loc.cache.json'))
    except:
      self.cache = {}

  def code(self, loc):
    self.calls += 1
    if self.calls % 1000 == 0:
      print ".",
    if loc in self.cache:
      if self.cache[loc] != []:
        self.good += 1
      return self.cache[loc]
    else:
      l = None
      try:
        l = self.coder.geocode(loc)
      except:
        time.sleep(1)
      if l != None:
        self.cache[loc] = l[1]
      else:
        self.cache[loc] = []

  def __del__(self):
    json.dump(self.cache, open('../data/loc.cache.json', 'w'))

def getUfo(line):
  try:
    return json.loads(line.strip(), strict=False)
  except Exception as e:
    return {}

ufos = [getUfo(line) for line in open('../data/ufo_awesome.json')]
empty = sum([1 if rec == {} else 0 for rec in ufos])
print "Total of ", empty, " errors reading ", len(ufos), " records."

def metaDataize(coder, record):
  return [coder.code(record['location'])]

coder = LocalLoc()
metadata = [metaDataize(coder, record) for record in ufos if record != {}]
json.dump(metadata, open('../data/ufo_metadata.json', 'w'))

print coder.good, " of ", coder.calls, " items geolocated."
