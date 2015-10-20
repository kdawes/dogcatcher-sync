This is a directory / file watcher that takes the file OPML/backup file, tranforms it to json, pulls down the individual RSS feeds, transforms them, stores some data about each.

Ideally, this would have some kinf of a message queue / worker pattern, but this is good enough for now.
