package com.library;

import com.library.impl.SearchStrategy;

import java.util.List;
import java.util.stream.Collectors;

public class SearchByName implements SearchStrategy {
    @Override
    public List<Book> search(List<Book> books, String query) {
        return books.stream()
                .filter(b -> b.getTitle().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }
}