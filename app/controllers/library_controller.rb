class LibraryController < ApplicationController
    def index
      @images = current_user.images.includes(:blob)
    end
  end
  