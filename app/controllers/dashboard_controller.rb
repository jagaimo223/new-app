class DashboardController < ApplicationController
  before_action :require_login

  def index
    @user = current_user
  end

  def upload_images
    @user = current_user
    if params[:images].present?
      params[:images].each do |image|
        @user.images.attach(image)
      end
      flash[:notice] = "画像をアップロードしました"
    else
      flash[:alert] = "画像を選択してください"
    end
    redirect_to dashboard_path
  end
end
