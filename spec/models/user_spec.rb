require 'rails_helper'

RSpec.describe User, type: :model do
    subject { described_class.new(name: 'Test User', email: 'test@example.com', password: 'password', password_confirmation: 'password') }
  
    it '名前が必須であること' do
      subject.name = nil
      expect(subject).not_to be_valid
    end
  
    it 'メールアドレスが必須であり、一意であること' do
      duplicate_user = subject.dup
      subject.save
      expect(duplicate_user).not_to be_valid
    end
  
    it 'パスワードの長さが3文字以上であること' do
      subject.password = 'ab'
      subject.password_confirmation = 'ab'
      expect(subject).not_to be_valid
    end
  
    it 'パスワード確認が必須であること' do
      subject.password_confirmation = nil
      expect(subject).not_to be_valid
    end
  
    it 'パスワードとパスワード確認が一致すること' do
      subject.password_confirmation = 'different'
      expect(subject).not_to be_valid
    end
  end
  