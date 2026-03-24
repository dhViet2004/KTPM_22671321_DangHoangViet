import java.util.ArrayList;
import java.util.List;

public class UIContainer implements UIElement {
    private String name;
    private List<UIElement> children = new ArrayList<>();

    public UIContainer(String name) {
        this.name = name;
    }

    public void add(UIElement element) {
        children.add(element);
    }

    public void remove(UIElement element) {
        children.remove(element);
    }

    @Override
    public void render() {
        System.out.println("\n[*] Đang vẽ khung chứa (Container): " + name);
        for (UIElement element : children) {
            element.render();
        }
    }
}