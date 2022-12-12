# Base

```bash
sudo systemctl enable systemd-networkd-wait-online.service
```

# Listener

## Setup

```bash
sudo cp energy-listener.service /etc/systemd/system/energy-listener.service
sudo systemctl enable energy-listener
```

## Restart

```bash
sudo systemctl restart energy-listener
```

## Status

```bash
sudo systemctl status energy-listener
```

## Journal

```bash
sudo journalctl -u energy-listener
```

# Reporter

## Setup

```bash
sudo cp energy-reporter.service /etc/systemd/system/energy-reporter.service
sudo systemctl enable energy-reporter
```

## Status

```bash
sudo systemctl status energy-reporter
```

## Journal

```bash
sudo journalctl -u energy-reporter
```
