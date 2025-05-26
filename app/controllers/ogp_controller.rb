class OgpController < ApplicationController
  def generate
    html = render_to_string(partial: 'ogp_template', locals: { title: params[:title] })
    kit = IMGKit.new(html, width: 1200, height: 630)

    file_path = Rails.root.join("public/ogp/#{params[:id]}.png")
    FileUtils.mkdir_p(File.dirname(file_path)) unless File.exist?(File.dirname(file_path))
    File.open(file_path, 'wb') { |file| file.write(kit.to_img(:png)) }

    render plain: "OGP生成完了"
  end
end
