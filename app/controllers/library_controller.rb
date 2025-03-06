class LibraryController < ApplicationController
    before_action :require_login 

  def index
    @images = current_user.images.includes(:blob)
  end

  def destroy_image
    image = current_user.images.find(params[:id])
    image.purge
    redirect_to library_index_path, notice: "画像を削除しました"
  end
end
