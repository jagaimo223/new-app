module ControllerMacros
    def login_user(user)
      allow(controller).to receive(:current_user).and_return(user)
    end
  end
  