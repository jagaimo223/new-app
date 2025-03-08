class AddUniqueIndexToPaints < ActiveRecord::Migration[8.0]
  def change
    add_index :paints, :name, unique: true
  end
end
