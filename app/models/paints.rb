class Paints < ApplicationRecord
    validates :name, presence: true
    validates :hex_code, presence: true, format: { with: /\A#[0-9A-Fa-f]{6}\z/, message: "HEXコードの形式が不正です (#FFFFFF の形式にしてください)" }
    validates :rgb_value, presence: true, format: { with: /\A\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)\z/, message: "RGB値の形式が不正です (255, 255, 255) の形式にしてください" }
    validates :maker, presence: true
  end
  