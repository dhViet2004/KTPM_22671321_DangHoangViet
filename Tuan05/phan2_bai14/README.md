# Bai 14 - Cau hinh mang rieng giua cac container

## Chay

```bash
docker compose up -d
```

## Kiem tra giao tiep

```bash
docker compose logs -f service-b
```

Service B se goi toi service-a qua DNS noi bo `service-a:5678` trong mang rieng `private_net`.
