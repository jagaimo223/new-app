FactoryBot.define do
    factory :paint do
      name { "Red" }
      hex_code { "#FF0000" }
      rgb_value { "(255, 0, 0)" }
      maker { "Test Maker" }
    end
  end
  