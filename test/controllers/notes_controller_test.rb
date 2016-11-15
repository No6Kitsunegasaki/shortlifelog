require 'test_helper'

class NotesControllerTest < ActionDispatch::IntegrationTest
  test "should get write" do
    get notes_write_url
    assert_response :success
  end

end
