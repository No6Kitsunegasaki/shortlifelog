class AddTapeIdToComments < ActiveRecord::Migration[5.0]
  def change
    add_column :comments, :tape_id, :integer
  end
end
