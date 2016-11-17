class AddPostedTimeToComments < ActiveRecord::Migration[5.0]
  def change
    add_column :comments, :posted_time, :bigint
  end
end
