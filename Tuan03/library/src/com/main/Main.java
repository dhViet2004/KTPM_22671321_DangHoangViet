package com.main;

import com.library.*;
import com.library.impl.Loan;

public class Main {
    public static void main(String[] args) {
        // 1. Singleton: Lấy đối tượng thư viện duy nhất
        Library myLibrary = Library.getInstance();

        // 2. Observer: Sinh viên đăng ký nhận thông báo
        Subscriber student1 = new Subscriber("Việt");
        Subscriber student2 = new Subscriber("An");
        myLibrary.attach(student1);
        myLibrary.attach(student2);

        System.out.println("====== NHẬP SÁCH MỚI ======");
        // 3. Factory: Tạo sách và đưa vào thư viện (Hệ thống sẽ tự báo tin cho Việt và An)
        Book book1 = BookFactory.createBook("Paper", "Java Core", "Tác giả A", "Lập trình");
        Book book2 = BookFactory.createBook("EBook", "Design Patterns", "Tác giả B", "Kiến trúc");
        
        myLibrary.addBook(book1);
        myLibrary.addBook(book2);

        System.out.println("\n====== TÌM KIẾM SÁCH ======");
        // 4. Strategy: Thay đổi chiến lược tìm kiếm
        System.out.println("Tìm sách có tên 'Java': " + myLibrary.searchBooks("Java").size() + " cuốn.");
        
        myLibrary.setSearchStrategy(new SearchByAuthor()); // Đổi sang tìm theo tác giả
        System.out.println("Tìm sách của 'Tác giả B': " + myLibrary.searchBooks("Tác giả B").size() + " cuốn.");

        System.out.println("\n====== MƯỢN SÁCH ======");
        // 5. Decorator: Mượn sách và thêm các tùy chọn
        Loan basicLoan = new BasicLoan(book1, "Nguyễn Văn X");
        System.out.println("Giao dịch 1: " + basicLoan.getLoanDetails());

        // Mượn sách + Gia hạn
        Loan extendedLoan = new ExtensionDecorator(new BasicLoan(book2, "Trần Thị Y"));
        System.out.println("Giao dịch 2: " + extendedLoan.getLoanDetails());

        // Mượn sách + Chữ nổi + Gia hạn (Trang trí nhiều lớp)
        Loan specialLoan = new ExtensionDecorator(new BrailleDecorator(new BasicLoan(book1, "Lê Khuyết Tật")));
        System.out.println("Giao dịch 3: " + specialLoan.getLoanDetails());
    }
}