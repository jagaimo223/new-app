class PaintsController < ApplicationController
require "roo"
before_action :require_login

def index
    @paints = Paint.all
end


def import
    file = params[:file]

    return redirect_to paints_path, alert: "ファイルを選択してください" if file.blank?

    spredsheet = Roo::Spreadsheet.open(file)
    header = spredsheet.row(1)

    errors = []

    (2..spredsheet.last_row).each do |i|
        row = Hash[[header, spredsheet.row(i)].transpose]
        row.each{ |k, v| row[k] = v.to_s }

        row["rgb_value"] = format_rgb(row["rgb_value"])

        paint = Paints.find_or_initialize_by(name: row["name"])
        paint.rgb_value = row["rgb_value"]
        paint.hex_code = row["hex_code"]
        paint.maker = row["maker"]

        begin
            paint.save!
        rescue ActiveRecord::RecordInvalid => e
            errors << "#{i}行目: #{e.record.errors.full_messages.join(", ")}"
        end
    end


    if errors.empty?
        redirect_to paints_path, notice: "インポートが完了しました"
    else
        redirect_to paints_path, alert: "インポート中にエラーが発生しました:\n#{errors.join("\n")}"
    end
end

private

def format_rgb(rgb_value)
  return rgb_value if rgb_value.match?(/\A\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)\z/)
  rgb_array = rgb_value.gsub(/[^0-9,]/, '').split(',').map(&:strip)
  "(#{rgb_array.join(', ')})"
end
end