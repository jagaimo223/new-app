require 'rails_helper'

RSpec.describe DashboardController, type: :controller do
  let(:user) { create(:user) }

  before do
    login_user(user)
  end

  describe "GET #index" do
    it "正常にレスポンスを返す" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST #search_paints" do
    it "正しい色データを返す" do
      paint = create(:paint, rgb_value: "(255, 0, 0)")
      post :search_paints, params: { color: "(255, 0, 0)" }, format: :json
      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body).first["id"]).to eq(paint.id)
    end
  end
end

RSpec.describe LibraryController, type: :controller do
  let(:user) { create(:user) }
  before { login_user(user) }

  describe "GET #index" do
    it "正常にレスポンスを返す" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end
end

RSpec.describe PaintsController, type: :controller do
  let(:user) { create(:user) }
  before { login_user(user) }

  describe "GET #index" do
    it "すべてのペイント情報を取得する" do
      create(:paint)
      get :index
      expect(response).to have_http_status(:success)
    end
  end
end

RSpec.describe SessionsController, type: :controller do
  let(:user) { create(:user, password: "password") }

  describe "POST #create" do
    it "正しい情報でログインできる" do
      post :create, params: { email: user.email, password: "password" }
      expect(response).to redirect_to(dashboard_index_path)
    end
  end
end

RSpec.describe UsersController, type: :controller do
  describe "POST #create" do
    it "新しいユーザーを作成する" do
      expect {
        post :create, params: { user: attributes_for(:user) }
      }.to change(User, :count).by(1)
    end
  end
end
