import json, time, datetime
from geopy import geocoders
import dateutil.parser

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

read_stats = {"Empty rows" : empty, "Rows read" : len(ufos)}
data = []

def metaDataize(coder, record):
  try:
    # TODO(katiek): replace raw dates with month, year
    sighted = dateutil.parser.parse(record['sighted_at'])
    reported = dateutil.parser.parse(record['reported_at'])
    shape = record['shape'].strip()
    # TODO(katiek): add duration converter
    # TODO(katiek): add "missile launch"!
    loc = coder.code(record['location'])
    datapos = len(data)
    data.append(record['description'])
    return [loc, record['location'], sighted, (reported - sighted).total_seconds(), shape, datapos]
  except:
    return []

coder = LocalLoc()
metadata = [metaDataize(coder, record) for record in ufos if record != []]
read_stats["Geoloc calls"] = coder.calls
read_stats["Geoloc good"] = coder.good

chunks = [data[start:start+1000] for start in range(0, len(data), 1000)]


# Dump to disk.
datehandler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime)  or isinstance(obj, datetime.date) else None
json.dump(metadata, open('../data/ufo_metadata.json', 'w'), default=datehandler)
for idx,chunk in enumerate(chunks):
  json.dump(chunk, open('../data/descriptions/ufo_data_' + str(1000*idx) + '.json', 'w'))
json.dump(read_stats, open('../data/ufo_read_stats.json', 'w'))

