IMGKit.configure do |config|
    if Rails.env.production?
      config.wkhtmltoimage = '/app/bin/wkhtmltoimage'
    else
      config.wkhtmltoimage = '/usr/bin/wkhtmltoimage'
    end
end
