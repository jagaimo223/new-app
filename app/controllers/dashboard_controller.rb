class DashboardController < ApplicationController
  before_action :require_login
  require "open-uri"
  require "mini_magick"

  def index
    @user = current_user
    @paints = Paint.all
  end

  def search_paints
    if params[:color].present? && params[:color] != "()"
      picked_rgb = parse_rgb(params[:color])
      if picked_rgb
        @paints = find_closest_paints(picked_rgb)
        render json: @paints # JSON で結果を返す
      else
        render json: { error: "Invalid color format" }, status: 400
      end
    else
      render json: { error: "No color provided" }, status: 400
    end
  end

  private

  def parse_rgb(rgb_string)
    rgb_string.gsub(/[()]/, "").split(",").map(&:to_i)
  end

  def find_closest_paints(picked_rgb)
    Paint.all.sort_by do |paint|
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
end
