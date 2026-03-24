public class TextBox implements UIElement {
    private String name;

    public TextBox(String name) {
        this.name = name;
    }

    @Override
    public void render() {
        System.out.println("   [TextBox] Hiển thị ô nhập liệu: " + name);
    }
}