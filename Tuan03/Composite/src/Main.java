public class Main {
    public static void main(String[] args) {
        UIElement btnLogin = new Button("Đăng nhập");
        UIElement btnCancel = new Button("Hủy");
        UIElement txtUsername = new TextBox("Tên người dùng");
        UIElement txtPassword = new TextBox("Mật khẩu");
        
        UIElement btnHome = new Button("Trang chủ");
        UIElement btnContact = new Button("Liên hệ");

        UIContainer loginDialog = new UIContainer("Hộp thoại Đăng nhập (Dialog)");
        loginDialog.add(txtUsername);
        loginDialog.add(txtPassword);
        loginDialog.add(btnLogin);
        loginDialog.add(btnCancel);

        UIContainer navBar = new UIContainer("Thanh điều hướng (Navigation Bar)");
        navBar.add(btnHome);
        navBar.add(btnContact);

        UIContainer mainWindow = new UIContainer("Cửa sổ chính (Main Window)");
        mainWindow.add(navBar);
        mainWindow.add(loginDialog);

        mainWindow.render();
    }
}