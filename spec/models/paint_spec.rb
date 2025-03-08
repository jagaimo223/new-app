require 'rails_helper'

RSpec.describe Paint, type: :model do
  subject { described_class.new(name: 'Red', hex_code: '#FF0000', rgb_value: '(255, 0, 0)', maker: 'ABC Paints') }

  it '名前が必須であること' do
    subject.name = nil
    expect(subject).not_to be_valid
  end

  it 'HEXコードが必須であること' do
    subject.hex_code = nil
    expect(subject).not_to be_valid
  end

  it 'HEXコードの形式が正しいこと' do
    subject.hex_code = '123456'
    expect(subject).not_to be_valid
  end

  it 'RGB値が必須であること' do
    subject.rgb_value = nil
    expect(subject).not_to be_valid
  end

  it 'RGB値の形式が正しいこと' do
    subject.rgb_value = '255,255,255'
    expect(subject).not_to be_valid
  end

  it 'メーカー名が必須であること' do
    subject.maker = nil
    expect(subject).not_to be_valid
  end
end