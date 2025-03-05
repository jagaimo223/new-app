class CreatePaints < ActiveRecord::Migration[8.0]
  def change
    create_table :paints do |t|
      t.string :name, null: false
      t.string :hex_code, null: false
      t.string :rgb_value, null: false
      t.string :maker, null: false

      t.timestamps
    end
  end
end
