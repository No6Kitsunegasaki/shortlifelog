json.data(@data) { |d| json.extract!(d, :id, :tape_id, :author, :text, :posted_time) }
