class ChangeRgbValueSize < ActiveRecord::Migration[8.0]
  def change
    change_column :paints, :rgb_value, :string, limit: 20
  end
end
