json.data(@data) { |d| json.extract!(d, :id, :author, :text) }
