# (Linux) Mounting Disks

This is so difficult every time. Let's note this down.

----

1. `lsblk` to identify the drives

```sh
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT
```

Look for drives like /dev/sdb, /dev/sdc, etc., that don’t have a mountpoint and no filesystem (FSTYPE empty).

2. Partition drives

```sh
sudo parted /dev/sdb -- mklabel gpt
sudo parted /dev/sdb -- mkpart primary ext4 0% 100%
sudo parted /dev/sdc -- mklabel gpt
sudo parted /dev/sdc -- mkpart primary ext4 0% 100%
```

3. Format drives

```sh
sudo mkfs.ext4 /dev/sdb1
sudo mkfs.ext4 /dev/sdc1
```

4. Get UUIDs

```sh
sudo blkid
#/dev/sdb1: UUID="abcd-1234" TYPE="ext4"
#/dev/sdc1: UUID="efgh-5678" TYPE="ext4"
```

5. Create mount points

```sh
sudo mkdir -p /mnt/disk2
sudo mkdir -p /mnt/disk3
```

6. Edit fstab to create persistent mounts

```sh
sudo nano /etc/fstab
```
```
UUID=abcd-1234  /mnt/disk2  ext4  defaults  0  2
UUID=efgh-5678  /mnt/disk3  ext4  defaults  0  2
```

7. Mount!

```sh
sudo mount -a
```
