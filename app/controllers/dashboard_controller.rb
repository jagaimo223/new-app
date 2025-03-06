class DashboardController < ApplicationController
  before_action :require_login
  require "open-uri"
  require "mini_magick"

  def index
    @user = current_user
    @paints = Paints.all
  
    if params[:color].present? && params[:color] != "()"
      picked_rgb = parse_rgb(params[:color])
      if picked_rgb
      @paints = find_closest_paints(picked_rgb)
    end
  end
end

  def upload_images
    @user = current_user
  
    if params[:canvas_image].present?
      image_data = params[:canvas_image]
      image_data = image_data.sub(/^data:image\/png;base64,/, "")
      file_path = "#{Rails.root}/tmp/uploaded_#{SecureRandom.hex}.png"
  
      File.open(file_path, 'wb') do |file|
        file.write(Base64.decode64(image_data))
      end
  
      @user.images.attach(io: File.open(file_path), filename: "processed_image.png", content_type: "image/png")
  
      flash[:notice] = "画像をアップロードしました"
    elsif params[:images].present?
      @user.images.attach(params[:images])
      flash[:notice] = "画像をアップロードしました"
    else
      flash[:alert] = "画像を選択してください"
    end
  
    redirect_to dashboard_path
  end
end

private

def parse_rgb(rgb_string)
  rgb_string.gsub(/[()]/, "").split(",").map(&:to_i)
end

def find_closest_paints(picked_rgb)
  closest_paints = Paints.all.sort_by do |paint|
    paint_rgb = parse_rgb(paint.rgb_value)
    color_distance(picked_rgb, paint_rgb)
  end.first(5)
end

def color_distance(rgb1, rgb2)
  r_mean = (rgb1[0] + rgb2[0]) / 2.0
  delta_r = rgb1[0] - rgb2[0]
  delta_g = rgb1[1] - rgb2[1]
  delta_b = rgb1[2] - rgb2[2]

  Math.sqrt((2 + r_mean / 256.0) * delta_r**2 + 4 * delta_g**2 + (2 + (255 - r_mean) / 256.0) * delta_b**2)
end
