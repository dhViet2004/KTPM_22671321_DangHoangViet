# Bai 10 - Luu tru du lieu voi Docker Volumes

## Chay

```bash
docker compose up -d
```

## Kiem tra volume

```bash
docker volume ls
docker volume inspect phan2_bai10_mysql_data
```

Du lieu MySQL duoc luu trong volume `mysql_data`, nen khi xoa container thi du lieu van con.
