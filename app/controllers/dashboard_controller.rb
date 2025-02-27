class DashboardController < ApplicationController
  before_action :require_login

  def index
    @user = current_user
  end

  def upload_images
    @user = current_user
    if params[:images].present?
      current_user.images.attach(params[:images])
      flash[:notice] = "画像をアップロードしました"
    else
      flash[:alert] = "画像を選択してください"
    end
    redirect_to dashboard_path
  end
end
