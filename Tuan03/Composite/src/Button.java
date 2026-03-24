public class Button implements UIElement {
    private String name;

    public Button(String name) {
        this.name = name;
    }

    @Override
    public void render() {
        System.out.println("   [Button] Hiển thị nút bấm: " + name);
    }
}